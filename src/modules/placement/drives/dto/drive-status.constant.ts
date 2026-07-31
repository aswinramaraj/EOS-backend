export const DRIVE_STATUSES = ['scheduled', 'completed', 'cancelled'] as const;

export type DriveStatus = (typeof DRIVE_STATUSES)[number];
