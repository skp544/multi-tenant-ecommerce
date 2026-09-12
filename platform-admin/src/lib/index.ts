export const getAvatarName = (fullName: string | undefined) => {
  return `${fullName?.split(" ")[0][0] ?? ""}${fullName?.split(" ")[1][0] ?? ""}`;
};
