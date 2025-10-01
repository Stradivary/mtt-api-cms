import ListZakat from "@/components/ListZakatRegistration/ListZakatRegistration";
import { Card } from "@/components/ui/card";

export default function DakwahHarianPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pendaftar Zakat</h2>
      </div>
      <Card className="p-6 space-y-4">
        <ListZakat />
      </Card>
    </div>
  );
}
