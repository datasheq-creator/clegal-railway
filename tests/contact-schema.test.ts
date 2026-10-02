import { describe, expect, it } from "vitest";
import { contactSchema, toFieldErrors } from "@/lib/contact/schema";

const valid = {
  name: "José Pérez-O'Neil",
  email: "  Jose@Empresa.CL ",
  phone: "+56 9 5896 1796",
  service: "demo",
  message: "Necesitamos una demo para nuestra planta.",
  lang: "es",
};

describe("contactSchema", () => {
  it("accepts and normalizes a valid payload", () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.email).toBe("jose@empresa.cl");
    expect(r.data?.name).toBe("José Pérez-O'Neil");
  });

  it("falls back to 'es' for unknown locales", () => {
    const r = contactSchema.safeParse({ ...valid, lang: "fr" });
    expect(r.data?.lang).toBe("es");
  });

  it("returns stable error codes per field", () => {
    const r = contactSchema.safeParse({ name: "", email: "nope", phone: "abc", service: "x", message: "hola" });
    expect(r.success).toBe(false);
    expect(toFieldErrors(r.error!)).toEqual({
      name: "name_min",
      email: "email_invalid",
      phone: "phone_invalid",
      service: "service_invalid",
      message: "message_min",
    });
  });

  it("rejects URLs, digits and control characters in the name (anti-spam / header injection)", () => {
    for (const name of ["http://spam.example", "Ana 123", "Ana\r\nBcc: x@y.z", "<b>Ana</b>"]) {
      const r = contactSchema.safeParse({ ...valid, name });
      expect(r.success, name).toBe(false);
      expect(toFieldErrors(r.error!).name).toBe("name_invalid");
    }
  });

  it("validates phone digit count (8–15)", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "1234567" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, phone: "+1 (415) 555-0100" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, phone: "+12345678901234567" }).success).toBe(false);
  });

  it("caps message length", () => {
    const r = contactSchema.safeParse({ ...valid, message: "a".repeat(2001) });
    expect(toFieldErrors(r.error!).message).toBe("message_max");
  });
});
