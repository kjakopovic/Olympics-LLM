interface CountryLeaderboardProps {
  country: string;
  gold: number;
  silver: number;
  bronze: number;
}

interface AthletePodiumCardProps {
  data: SportsmanData;
  position: number;
}

interface PodiumCardProps {
  data: CountryLeaderboardProps;
  position: number;
}

interface AthleteLeaderboardProps {
  data: SportsmanData[];
}

interface LeaderBoardProps {
  data: CountryLeaderboardProps[];
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface ChatBarProps {
  onSend: (text: string) => void;
}

interface CarouselProps {
  newsData?: NewsData[];
  carouselDataLength: number;
}

interface SportFilters {
  medal: string;
  name: string;
  sex: string;
  sport: string;
  event_name: string;
  country: string;
}

interface SportsmanData {
  name: string;
  sex: string;
  sport: string;
  event: string;
  medal: string;
  team: string;
  year: number;
}

interface PodiumData {
  data: CountryLeaderboardProps | SportsmanData;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

interface SportFilters {
  medal: string;
  name: string;
  sex: string;
  sport: string;
  event_name: string;
  country: string;
}

interface FilterFormProps {
  initialFilters: SportFilters;
  onSubmit: (filters: SportFilters) => void;
}

interface NewsData {
  id: string;
  title: string;
  description: string;
  published_at: string;
  tags: string[];
  pictures_url: NewsPicture[];
}

interface NewsPicture {
  key: string;
  url: string;
}