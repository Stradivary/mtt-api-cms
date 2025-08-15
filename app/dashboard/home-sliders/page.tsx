import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ListHomeSliders from "@/components/ListHomeSliders/ListHomeSliders";

export default function DakwahHarianPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Slider Beranda</h2>
        <Link href="/dashboard/home-sliders/create">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 cursor-pointer">
            <Plus className="w-4 h-4" />
            Tambah Slider Beranda
          </Button>
        </Link>
      </div>
      <ListHomeSliders />
    </div>
  );
}
