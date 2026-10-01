import moment from "moment";

export const getRelativeTime = (date: string | Date) => moment(date).fromNow();

export const getAvatarName =(fullName: string | undefined) => {
  const [first, second] = fullName?.trim().split(" ") ?? [];
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`;
};
