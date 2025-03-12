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