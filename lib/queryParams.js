
export const cleanParams = (params) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };