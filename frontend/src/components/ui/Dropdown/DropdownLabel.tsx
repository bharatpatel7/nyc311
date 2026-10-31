import Label from "@/components/ui/Label";

interface DropdownLabelProps {
  id: string;
  label: string;
}

const DropdownLabel = ({ id, label }: DropdownLabelProps) => <Label id={id} label={label} />;

export default DropdownLabel;
