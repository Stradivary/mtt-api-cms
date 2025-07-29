import ListProposal from "@/components/ListProposal/ListProposal";
import { Card } from "@/components/ui/card";

export default function DakwahHarianPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Proposal</h2>
      </div>
      <Card className="p-6 space-y-4">
        <ListProposal />
      </Card>
    </div>
  );
}
