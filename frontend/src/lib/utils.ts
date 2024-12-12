export function toHex(v: number | undefined): string {
  return ("00" + v?.toString(16).toUpperCase()).substr(-2);
}

interface MultipleDeleteSubscriberData {
  ueId: string;
  plmnID: string;
}

export function formatMultipleDeleteSubscriberToJson(subscribers: MultipleDeleteSubscriberData[]) {
  return subscribers.map(sub => ({
    ueId: sub.ueId,
    plmnID: sub.plmnID
  }));
}

interface MultipleDeleteProfileData {
  profileName: string;
}

export function formatMultipleDeleteProfileToJson(profiles: MultipleDeleteProfileData[]) {
  return profiles.map(profile => ({
    profileName: profile.profileName
  }));
}