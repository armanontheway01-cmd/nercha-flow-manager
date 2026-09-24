import { createServerFn } from "@tanstack/react-start";

type Auth = { token: string };

/* ---------------------------------- public --------------------------------- */

export const getPublicHome = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("./nercha.server");
  const supabase = await db();
  const [status, gallery, duties, students, tokens] = await Promise.all([
    supabase.from("site_status").select("*").eq("id", 1).maybeSingle(),
    supabase.from("gallery_images").select("*").order("created_at", { ascending: false }).limit(12),
    supabase.from("duties").select("id, name, description, location, start_time, end_time"),
    supabase.from("students").select("id, present, duty_id"),
    supabase.from("tokens").select("id, status"),
  ]);

  const studentRows = students.data ?? [];
  return {
    status: status.data,
    gallery: gallery.data ?? [],
    duties: duties.data ?? [],
    volunteers: studentRows.length,
    present: studentRows.filter((s) => s.present).length,
    assigned: studentRows.filter((s) => s.duty_id).length,
    activeTokens: (tokens.data ?? []).filter((t) => t.status === "active").length,
  };
});

/* ----------------------------------- auth ---------------------------------- */

export const login = createServerFn({ method: "POST" })
  .inputValidator((input: { role: string; username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { db, sha256Hex, signSession } = await import("./nercha.server");
    const supabase = await db();
    const username = data.username.trim();
    const password = data.password;
    const fail = { error: "Wrong login details" as string | null, session: null };

    if (data.role === "admin") {
      const { data: row } = await supabase
        .from("admins")
        .select("*")
        .eq("login_id", username)
        .maybeSingle();
      if (!row || row.password_hash !== (await sha256Hex(password))) return fail;
      const token = await signSession({
        role: "admin",
        id: row.id,
        name: row.name,
        loginId: row.login_id,
      });
      return { error: null, session: { token, role: "admin", name: row.name, loginId: row.login_id } };
    }

    if (data.role === "incharge" || data.role === "distributor") {
      const table = data.role === "incharge" ? "incharges" : "distributors";
      const { data: row } = await supabase
        .from(table)
        .select("*")
        .eq("login_id", username)
        .maybeSingle();
      if (!row || row.password_hash !== (await sha256Hex(password))) return fail;
      const token = await signSession({
        role: data.role,
        id: row.id,
        name: row.name,
        loginId: row.login_id,
      });
      return {
        error: null,
        session: { token, role: data.role, name: row.name, loginId: row.login_id },
      };
    }

    if (data.role === "student") {
      const { data: row } = await supabase
        .from("students")
        .select("*")
        .eq("adno", username)
        .maybeSingle();
      if (!row || password.trim() !== row.adno) return fail;
      const token = await signSession({
        role: "student",
        id: row.id,
        name: row.name,
        loginId: row.adno,
      });
      return { error: null, session: { token, role: "student", name: row.name, loginId: row.adno } };
    }

    return fail;
  });

/* ---------------------------------- admin ---------------------------------- */

export const getAdminData = createServerFn({ method: "POST" })
  .inputValidator((input: Auth) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const [duties, students, incharges, inchargeDuties, inventory, donations, tokens, gallery, status, distributors] =
      await Promise.all([
        supabase.from("duties").select("*").order("created_at"),
        supabase.from("students").select("*").order("name"),
        supabase.from("incharges").select("id, name, phone, login_id").order("name"),
        supabase.from("incharge_duties").select("*"),
        supabase.from("inventory_items").select("*").order("name"),
        supabase.from("donations").select("*").order("created_at", { ascending: false }),
        supabase.from("tokens").select("*").order("created_at", { ascending: false }),
        supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
        supabase.from("site_status").select("*").eq("id", 1).maybeSingle(),
        supabase.from("distributors").select("id, name, phone, login_id").order("name"),
      ]);

    return {
      duties: duties.data ?? [],
      students: students.data ?? [],
      incharges: incharges.data ?? [],
      inchargeDuties: inchargeDuties.data ?? [],
      inventory: inventory.data ?? [],
      donations: donations.data ?? [],
      tokens: tokens.data ?? [],
      gallery: gallery.data ?? [],
      status: status.data,
      distributors: distributors.data ?? [],
    };
  });

export const saveDuty = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      id?: string | undefined;
      name: string;
      description?: string | undefined;
      location?: string | undefined;
      start_time?: string | undefined;
      end_time?: string | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const row = {
      name: data.name,
      description: data.description ?? null,
      location: data.location ?? null,
      start_time: data.start_time ?? null,
      end_time: data.end_time ?? null,
    };
    if (data.id) await supabase.from("duties").update(row).eq("id", data.id);
    else await supabase.from("duties").insert(row);
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { table: string; id: string }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const allowed = [
      "duties",
      "students",
      "incharges",
      "distributors",
      "inventory_items",
      "donations",
      "tokens",
      "gallery_images",
    ];
    if (!allowed.includes(data.table)) throw new Error("Unknown table");
    const supabase = (await db()) as unknown as {
      from: (table: string) => {
        delete: () => { eq: (column: string, value: string) => Promise<unknown> };
      };
    };
    await supabase.from(data.table).delete().eq("id", data.id);
    return { ok: true };
  });

export const saveStudent = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      id?: string | undefined;
      adno: string;
      name: string;
      dept?: string | undefined;
      phone?: string | undefined;
      present?: boolean | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const row = {
      adno: data.adno.trim(),
      name: data.name.trim(),
      dept: data.dept ?? null,
      phone: data.phone ?? null,
      present: data.present ?? true,
    };
    const result = data.id
      ? await supabase.from("students").update(row).eq("id", data.id)
      : await supabase.from("students").insert(row);
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, error: null };
  });

export const bulkAddStudents = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      rows: { adno: string; name: string; dept?: string | undefined; phone?: string | undefined; present?: boolean | undefined }[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const rows = data.rows
      .filter((r) => r.adno && r.name)
      .map((r) => ({
        adno: String(r.adno).trim(),
        name: String(r.name).trim(),
        dept: r.dept ?? null,
        phone: r.phone ?? null,
        present: r.present ?? true,
      }));
    if (!rows.length) return { added: 0, error: "No valid rows found" };
    const { error } = await supabase.from("students").upsert(rows, { onConflict: "adno" });
    return { added: error ? 0 : rows.length, error: error?.message ?? null };
  });

export const saveIncharge = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      id?: string | undefined;
      name: string;
      phone?: string | undefined;
      login_id: string;
      password?: string | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole, sha256Hex } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const base = {
      name: data.name.trim(),
      phone: data.phone ?? null,
      login_id: data.login_id.trim(),
    };
    if (data.id) {
      const row = data.password
        ? { ...base, password_hash: await sha256Hex(data.password) }
        : base;
      const { error } = await supabase.from("incharges").update(row).eq("id", data.id);
      return { ok: !error, error: error?.message ?? null };
    }
    if (!data.password) return { ok: false, error: "Password is required" };
    const { error } = await supabase
      .from("incharges")
      .insert({ ...base, password_hash: await sha256Hex(data.password) });
    return { ok: !error, error: error?.message ?? null };
  });

export const bulkAddIncharges = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      rows: { name: string; phone?: string | undefined; login_id: string; password: string }[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole, sha256Hex } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const rows = [];
    for (const r of data.rows) {
      if (!r.name || !r.login_id || !r.password) continue;
      rows.push({
        name: String(r.name).trim(),
        phone: r.phone ?? null,
        login_id: String(r.login_id).trim(),
        password_hash: await sha256Hex(String(r.password)),
      });
    }
    if (!rows.length) return { added: 0, error: "No valid rows found" };
    const { error } = await supabase.from("incharges").upsert(rows, { onConflict: "login_id" });
    return { added: error ? 0 : rows.length, error: error?.message ?? null };
  });

export const setInchargeDuties = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { inchargeId: string; dutyIds: string[] }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    await supabase.from("incharge_duties").delete().eq("incharge_id", data.inchargeId);
    if (data.dutyIds.length) {
      await supabase
        .from("incharge_duties")
        .insert(data.dutyIds.map((duty_id) => ({ incharge_id: data.inchargeId, duty_id })));
    }
    return { ok: true };
  });

export const assignStudentsToDuty = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & { dutyId: string; studentIds: string[]; captainId?: string | null | undefined }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    if (data.studentIds.length) {
      await supabase
        .from("students")
        .update({ duty_id: data.dutyId, is_captain: false })
        .in("id", data.studentIds);
    }
    if (data.captainId) {
      await supabase.from("students").update({ is_captain: false }).eq("duty_id", data.dutyId);
      await supabase
        .from("students")
        .update({ duty_id: data.dutyId, is_captain: true })
        .eq("id", data.captainId);
    }
    return { ok: true };
  });

export const unassignStudent = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { studentId: string }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin", "incharge");
    const supabase = await db();
    await supabase
      .from("students")
      .update({ duty_id: null, is_captain: false })
      .eq("id", data.studentId);
    return { ok: true };
  });

export const saveInventoryItem = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      id?: string | undefined;
      name: string;
      quantity: number;
      unit: string;
      status: string;
      note?: string | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const row = {
      name: data.name.trim(),
      quantity: data.quantity,
      unit: data.unit,
      status: data.status,
      note: data.note ?? null,
    };
    if (data.id) await supabase.from("inventory_items").update(row).eq("id", data.id);
    else await supabase.from("inventory_items").insert(row);
    return { ok: true };
  });

export const addDonation = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      donor_name: string;
      phone?: string | undefined;
      amount: number;
      packets: number;
      note?: string | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const receipt = `AN-${Date.now().toString().slice(-8)}`;
    const { error } = await supabase.from("donations").insert({
      receipt_no: receipt,
      donor_name: data.donor_name.trim(),
      phone: data.phone ?? null,
      amount: data.amount,
      packets: data.packets,
      note: data.note ?? null,
    });
    return { ok: !error, receipt, error: error?.message ?? null };
  });

export const createToken = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { donor_name: string; packets: number }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const code = `NERCHA-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    const { data: row, error } = await supabase
      .from("tokens")
      .insert({ code, donor_name: data.donor_name.trim(), packets: data.packets })
      .select()
      .maybeSingle();
    return { ok: !error, tokenRow: row, error: error?.message ?? null };
  });

export const saveDistributor = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & { id?: string | undefined; name: string; phone?: string | undefined; login_id: string; password?: string | undefined }) =>
      input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole, sha256Hex } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const base = { name: data.name.trim(), phone: data.phone ?? null, login_id: data.login_id.trim() };
    if (data.id) {
      const row = data.password ? { ...base, password_hash: await sha256Hex(data.password) } : base;
      const { error } = await supabase.from("distributors").update(row).eq("id", data.id);
      return { ok: !error, error: error?.message ?? null };
    }
    if (!data.password) return { ok: false, error: "Password is required" };
    const { error } = await supabase
      .from("distributors")
      .insert({ ...base, password_hash: await sha256Hex(data.password) });
    return { ok: !error, error: error?.message ?? null };
  });

export const saveStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (input: Auth & {
      is_ongoing: boolean;
      headline: string;
      subline: string;
      packets_issued: number;
      notice?: string | undefined;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    await supabase
      .from("site_status")
      .update({
        is_ongoing: data.is_ongoing,
        headline: data.headline,
        subline: data.subline,
        packets_issued: data.packets_issued,
        notice: data.notice ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    return { ok: true };
  });

export const addGalleryImage = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { url: string; caption?: string | undefined }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin");
    const supabase = await db();
    const { error } = await supabase
      .from("gallery_images")
      .insert({ url: data.url.trim(), caption: data.caption ?? null });
    return { ok: !error, error: error?.message ?? null };
  });

/* --------------------------------- incharge -------------------------------- */

export const getInchargeData = createServerFn({ method: "POST" })
  .inputValidator((input: Auth) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    const session = await requireRole(data.token, "incharge");
    const supabase = await db();
    const { data: links } = await supabase
      .from("incharge_duties")
      .select("duty_id")
      .eq("incharge_id", session.id);
    const dutyIds = (links ?? []).map((l) => l.duty_id);
    if (!dutyIds.length) return { name: session.name, duties: [], students: [] };
    const [duties, students] = await Promise.all([
      supabase.from("duties").select("*").in("id", dutyIds),
      supabase.from("students").select("*").in("duty_id", dutyIds).order("name"),
    ]);
    return { name: session.name, duties: duties.data ?? [], students: students.data ?? [] };
  });

export const setStudentPresence = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { studentId: string; present: boolean }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin", "incharge");
    const supabase = await db();
    await supabase.from("students").update({ present: data.present }).eq("id", data.studentId);
    return { ok: true };
  });

export const setCaptain = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { studentId: string; dutyId: string }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "admin", "incharge");
    const supabase = await db();
    await supabase.from("students").update({ is_captain: false }).eq("duty_id", data.dutyId);
    await supabase.from("students").update({ is_captain: true }).eq("id", data.studentId);
    return { ok: true };
  });

/* --------------------------------- student --------------------------------- */

export const getStudentData = createServerFn({ method: "POST" })
  .inputValidator((input: Auth) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    const session = await requireRole(data.token, "student");
    const supabase = await db();
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("id", session.id)
      .maybeSingle();
    if (!student) return { student: null, duty: null, incharges: [], mates: [] };
    if (!student.duty_id) return { student, duty: null, incharges: [], mates: [] };
    const [duty, links, mates] = await Promise.all([
      supabase.from("duties").select("*").eq("id", student.duty_id).maybeSingle(),
      supabase.from("incharge_duties").select("incharge_id").eq("duty_id", student.duty_id),
      supabase.from("students").select("id, name, adno, is_captain").eq("duty_id", student.duty_id),
    ]);
    const inchargeIds = (links.data ?? []).map((l) => l.incharge_id);
    const incharges = inchargeIds.length
      ? (await supabase.from("incharges").select("name, phone").in("id", inchargeIds)).data ?? []
      : [];
    return { student, duty: duty.data, incharges, mates: mates.data ?? [] };
  });

/* ------------------------------- distributor ------------------------------- */

export const lookupToken = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { code: string }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    await requireRole(data.token, "distributor", "admin");
    const supabase = await db();
    const { data: row } = await supabase
      .from("tokens")
      .select("*")
      .eq("code", data.code.trim())
      .maybeSingle();
    if (!row) return { tokenRow: null, error: "This code is not a valid Nercha token" };
    return { tokenRow: row, error: null };
  });

export const redeemToken = createServerFn({ method: "POST" })
  .inputValidator((input: Auth & { code: string }) => input)
  .handler(async ({ data }) => {
    const { db, requireRole } = await import("./nercha.server");
    const session = await requireRole(data.token, "distributor", "admin");
    const supabase = await db();
    const { data: row } = await supabase
      .from("tokens")
      .select("*")
      .eq("code", data.code.trim())
      .maybeSingle();
    if (!row) return { ok: false, error: "Token not found" };
    if (row.status !== "active") return { ok: false, error: "This token was already supplied" };
    await supabase
      .from("tokens")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        redeemed_by: session.name,
      })
      .eq("id", row.id);
    const { data: status } = await supabase
      .from("site_status")
      .select("packets_issued")
      .eq("id", 1)
      .maybeSingle();
    await supabase
      .from("site_status")
      .update({ packets_issued: (status?.packets_issued ?? 0) + row.packets })
      .eq("id", 1);
    return { ok: true, error: null, packets: row.packets };
  });
