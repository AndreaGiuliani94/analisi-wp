export interface VideoInterval {
  start: string;
  end: string;
  category: string;
  title: string
  errors: {
    start: string;
    end: string;
    title: string;
  };
}

export interface VideoIntervalNew {
  id?: string
  category: string
  anchorTime: number
  title: string
  type: string
  offsetStart: number
  offsetEnd: number
  teamId?: string | null
  playerNumber?: number | null
}