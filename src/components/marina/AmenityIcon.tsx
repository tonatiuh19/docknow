import { FiZap, FiDroplet, FiWifi, FiShield, FiCoffee } from "react-icons/fi";
import {
  MdLocalGasStation,
  MdWc,
  MdShower,
  MdLocalLaundryService,
  MdLocalParking,
} from "react-icons/md";

interface AmenityIconProps {
  iconName: string;
  className?: string;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } =
  {
    FiZap,
    FiDroplet,
    FiWifi,
    FiShield,
    FiCoffee,
    MdLocalGasStation,
    MdWc,
    MdShower,
    MdLocalLaundryService,
    MdLocalParking,
  };

export default function AmenityIcon({
  iconName,
  className = "w-5 h-5",
}: AmenityIconProps) {
  const IconComponent = iconMap[iconName];

  if (!IconComponent) {
    // Fallback to a default icon or return null
    return <FiCoffee className={className} />;
  }

  return <IconComponent className={className} />;
}
