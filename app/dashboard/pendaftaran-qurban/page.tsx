import ListPendaftaranQurban from "@/components/ListPendaftaranQurban/ListPendaftaranQurban";
import { Card } from "@/components/ui/card";

export default function PendaftaranQurbanPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pendaftaran Kurban 1447H</h2>
      </div>
      <Card className="p-6 space-y-4">
        <ListPendaftaranQurban />
      </Card>
    </div>
  );
}
