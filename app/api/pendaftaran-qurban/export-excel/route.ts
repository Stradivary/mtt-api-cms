import { supabaseServer } from "@/lib/supabase-server";
import * as XLSX from "xlsx";

const TABLE_NAME = "qurban_registration_1447h";

export async function GET() {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const formattedData = (data || []).map((item) => ({
    Nama: item.nama,
    Email: item.email || "-",
    "Nomor HP": item.hp,
    "Qurban Items": Array.isArray(item.qurban_items)
      ? item.qurban_items
          .map((q: { hewan?: string; qty?: string; atasNama?: string; atasNamaList?: string[] }) =>
            `Hewan Kurban: ${q.hewan || '-'}\nQty: ${q.qty || '-'}\nAtas Nama: ${Array.isArray(q.atasNamaList) && q.atasNamaList.length > 0 ? q.atasNamaList.join(', ') : q.atasNama || '-'}`
          )
          .join('\n---\n')
      : "-",
    "Tujuan Qurban": item.tujuan_qurban,
    Lembaga: item.lembaga,
    "Bukti Bayar": item.bukti_bayar_url || "-",
    Tanggal: item.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Qurban1447H");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=pendaftaran-kurban-1447h.xlsx",
    },
  });
}
