interface CountryLeaderboardProps {
  country: string;
  gold: number;
  silver: number;
  bronze: number;
}

interface PodiumCardProps {
  data: CountryLeaderboardProps;
  position: number;
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
