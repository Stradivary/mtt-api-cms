import { supabaseServer } from "@/lib/supabase-server";
import * as XLSX from "xlsx";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("pendaftaran_kurban_1447h")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const formattedData = (data || []).map((item) => ({
    Nama: item.nama,
    "Nomor HP": item.hp,
    Hewan: item.hewan,
    Qty: item.qty,
    "Atas Nama": item.atas_nama,
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
