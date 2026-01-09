const normalizeDiseaseName = (name) => {
  if (!name || typeof name !== 'string') return null;
  return name.trim().toLowerCase().replace(/\s+/g, '_');
};

const normalizeDisplayName = (name) => {
  if (!name || typeof name !== 'string') return null;
  return name.trim().split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const normalizeBodyPart = (bodyPart) => {
  if (!bodyPart || typeof bodyPart !== 'string') return null;
  return bodyPart.trim().toLowerCase().replace(/\s+/g, '_');
};

module.exports = {
  normalizeDiseaseName,
  normalizeDisplayName,
  normalizeBodyPart
};
