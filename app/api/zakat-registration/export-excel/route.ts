import { supabaseServer } from "@/lib/supabase-server";
import * as XLSX from "xlsx";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("zakat_registration")
    .select("*");

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Zakat");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=zakat-data.xlsx",
    },
  });
}
