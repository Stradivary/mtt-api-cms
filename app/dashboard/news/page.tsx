import Link from "next/link";
import { Button } from "@/components/ui/button";
import ListNews from "@/components/ListNews/ListNews";
import { Plus } from "lucide-react";

export default function DashboardHome() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Berita</h2>
        <Link href="/dashboard/news/create">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 cursor-pointer">
            <Plus className="w-4 h-4" />
            Tambah Berita
          </Button>
        </Link>
      </div>
      <ListNews />
    </div>
  );
}
