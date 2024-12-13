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
