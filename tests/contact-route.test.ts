import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const setApiKey = vi.fn();
vi.mock("@sendgrid/mail", () => ({
  default: { send: (...args: unknown[]) => send(...args), setApiKey, setTimeout: vi.fn() },
}));

const { POST, GET } = await import("@/app/api/contact/route");

const ENV = {
  SENDGRID_API_KEY: "SG.test",
  SENDGRID_SENDER_EMAIL: "noreply@clegal.example",
  ADMIN_EMAIL: "leads@clegal.example",
};

const valid = {
  name: "Camila Rojas",
  email: "camila@empresa.cl",
  phone: "+56 9 1234 5678",
  service: "demo",
  message: "Queremos una demo para tres instalaciones.",
  lang: "es",
};

let ipCounter = 0;
function request(body: unknown, init: { ip?: string; contentType?: string; raw?: string } = {}) {
  ipCounter += 1;
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": init.contentType ?? "application/json",
      "x-forwarded-for": init.ip ?? `198.51.100.${ipCounter}`,
      "user-agent": "vitest",
    },
    body: init.raw ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  send.mockReset().mockResolvedValue([{ statusCode: 202 }, {}]);
  setApiKey.mockReset();
  for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
  vi.stubEnv("SENDGRID_DRY_RUN", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("sends the internal notification, then the client confirmation", async () => {
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, confirmation: "sent" });
    expect(setApiKey).toHaveBeenCalledWith("SG.test");
    expect(send).toHaveBeenCalledTimes(2);

    const [internal] = send.mock.calls[0]!;
    expect(internal.to).toBe(ENV.ADMIN_EMAIL);
    expect(internal.from.email).toBe(ENV.SENDGRID_SENDER_EMAIL);
    expect(internal.replyTo).toEqual({ email: valid.email, name: valid.name });
    expect(internal.html).toContain(valid.message);

    const [confirmation] = send.mock.calls[1]!;
    expect(confirmation.to.email).toBe(valid.email);
    expect(confirmation.from.email).toBe(ENV.SENDGRID_SENDER_EMAIL);
    expect(confirmation.replyTo).toBe(ENV.ADMIN_EMAIL);
    expect(confirmation.html).toContain("Hemos recibido tu mensaje con éxito");
    expect(confirmation.html).toContain("+56958961796");
  });

  it("rejects invalid payloads with field error codes and sends nothing", async () => {
    const res = await POST(request({ ...valid, email: "bad", phone: "1" }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.fieldErrors).toEqual({ email: "email_invalid", phone: "phone_invalid" });
    expect(send).not.toHaveBeenCalled();
  });

  it("fails with 502 and skips the confirmation when the internal email fails", async () => {
    send.mockRejectedValueOnce(Object.assign(new Error("Unauthorized"), { code: 401 }));
    const res = await POST(request(valid));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("delivery");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("still succeeds (lead captured) when only the confirmation fails", async () => {
    send.mockResolvedValueOnce([{ statusCode: 202 }, {}]).mockRejectedValueOnce(new Error("Bad recipient"));
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, confirmation: "failed" });
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(request({ ...valid, company_website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 500 when SendGrid is not configured", async () => {
    vi.stubEnv("SENDGRID_API_KEY", "");
    const res = await POST(request(valid));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("config");
    expect(send).not.toHaveBeenCalled();
  });

  it("does not call SendGrid in dry-run mode", async () => {
    vi.stubEnv("SENDGRID_API_KEY", "");
    vi.stubEnv("SENDGRID_DRY_RUN", "1");
    vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(request(valid, { ip: "192.0.2.50" }))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("guards content type, JSON and body size", async () => {
    expect((await POST(request(valid, { contentType: "text/plain" }))).status).toBe(415);
    expect((await POST(request(null, { raw: "{not json" }))).status).toBe(400);
    expect((await POST(request({ ...valid, message: "x".repeat(20_000) }))).status).toBe(413);
  });

  it("rejects GET", async () => {
    expect(GET().status).toBe(405);
  });
});

describe("company inbox variable (Railway)", () => {
  it("accepts CONTACT_TO_EMAIL / SENDGRID_FROM_EMAIL (DATASHEQ names) when the C-Legal names are unset", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("SENDGRID_SENDER_EMAIL", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "ventas@clegal.example");
    vi.stubEnv("SENDGRID_FROM_EMAIL", "no-reply@clegal.example");
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    const [internal] = send.mock.calls[0]!;
    expect(internal.to).toBe("ventas@clegal.example");
    expect(internal.from.email).toBe("no-reply@clegal.example");
    const [confirmation] = send.mock.calls[1]!;
    expect(confirmation.replyTo).toBe("ventas@clegal.example");
  });

  it("sends the lead to every address in a comma-separated list", async () => {
    vi.stubEnv("ADMIN_EMAIL", "ventas@clegal.example, gerencia@clegal.example");
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    const [internal] = send.mock.calls[0]!;
    expect(internal.to).toEqual(["ventas@clegal.example", "gerencia@clegal.example"]);
    const [confirmation] = send.mock.calls[1]!;
    expect(confirmation.replyTo).toBe("ventas@clegal.example");
  });

  it("returns 500 (config) when no company inbox is set", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    const res = await POST(request(valid));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("config");
    expect(send).not.toHaveBeenCalled();
  });
});
