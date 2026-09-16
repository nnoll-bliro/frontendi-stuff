// TODO: auto fixed - please try to fix
// oxlint-disable-next-line typescript/no-explicit-any
function isString(value: any): value is string {
  return typeof value === "string";
}

// TODO: auto fixed - please try to fix
// oxlint-disable-next-line typescript/no-explicit-any
function isValidString(value: any): value is string {
  return isString(value) && value !== null && value !== undefined;
}

const isEmail = (str: string | null | undefined) => {
  if (!str) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(str);
};

function splitName(fullName: string): {
  firstName?: string;
  lastName?: string;
} {
  const names = fullName.split(" ");
  const firstName = names[0] ? names[0] : undefined;
  const lastName: string | undefined = names.length > 1 ? names[names.length - 1] : undefined;

  return { firstName, lastName };
}

/**
 * Get the formatted name for the participant optimized for select options
 * in format of [First Name] [Last Name] ([Identifier]) or [Identifier]
 * if neither name nor Identifier is provided return "Unknown Participant"
 * @param name Full name of the participant
 * @param identifier Can be email or phone number
 * @returns Formatted name for the participant
 */
export const getParticipantOptionName = (
  name: string | undefined | null,
  identifier: string | undefined | null,
): string => {
  if (isValidString(name)) {
    const optionNames = [];
    const { firstName, lastName } = splitName(name);

    if (isValidString(firstName) && !isEmail(firstName)) optionNames.push(firstName);
    if (isValidString(lastName) && !isEmail(lastName)) optionNames.push(lastName);
    if (optionNames.length > 0) {
      optionNames.push(`(${identifier})`);
    } else {
      optionNames.push(identifier);
    }
    return optionNames.join(" ");
  } else if (isValidString(identifier)) {
    return identifier;
  } else {
    return "Unknown Participant";
  }
};

/**
 * Get the formatted name for the participant optimized for display
 * in format of [First Name] [Last Name]|[First Letter of LastName][.] or [Identifier]
 * if neither name nor Identifier is provided return "Unknown Participant"
 * @param name Full name of the participant
 * @param identifier Can be email or phone number
 * @returns Formatted name for the participant
 */
export const getParticipantName = (
  name: string | undefined | null,
  identifier: string | undefined | null,
): string => {
  if (isValidString(name)) {
    const optionNames = [];
    const { firstName, lastName } = splitName(name);

    if (isValidString(firstName) && !isEmail(firstName)) optionNames.push(firstName);
    if (isValidString(lastName) && !isEmail(lastName)) {
      if (optionNames.length > 0 && lastName.length > 0) optionNames.push(`${lastName[0]}.`);
      else optionNames.push(lastName);
    }
    if (optionNames.length === 0) {
      optionNames.push(identifier);
    }
    return optionNames.join(" ");
  } else if (isValidString(identifier)) {
    return identifier;
  } else {
    return "Unknown Participant";
  }
};

function getAvatarTitleFromName(name: string | undefined | null): string | null {
  if (isValidString(name)) {
    const { firstName, lastName } = splitName(name);
    const FLFN = isValidString(firstName) && firstName.length ? firstName[0] : "";
    const FLLN = isValidString(lastName) && lastName.length ? lastName[0] : "";
    return `${FLFN}${FLLN}`;
  }
  return null;
}

function getAvatarTitleFromIdentifier(identifier: string | undefined | null): string | null {
  if (isValidString(identifier) && identifier.length) {
    return identifier[0];
  }
  return null;
}

export const getAvatarTitle = (
  name: string | undefined | null,
  identifier: string | undefined | null,
): string => {
  return getAvatarTitleFromName(name) || getAvatarTitleFromIdentifier(identifier) || "UK";
};
