function resolveUploadedFileUrl(file) {
    if (!file) return null;
    return file.path || file.secure_url || file.url || null;
}

function isRemoteImageUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

module.exports = {
    resolveUploadedFileUrl,
    isRemoteImageUrl,
};
