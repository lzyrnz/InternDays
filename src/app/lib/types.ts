export interface JournalEntry {
  id: string;
  date: string; // ISO format
  tasks: string;
  learnings: string;
  hours: number;
  isHoliday?: boolean;
}

export interface OJTSettings {
  totalRequiredHours: number;
  excludeWeekends?: boolean;
}

export interface AppState {
  entries: JournalEntry[];
  settings: OJTSettings;
}
