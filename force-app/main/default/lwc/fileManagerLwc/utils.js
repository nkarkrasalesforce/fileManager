/** Formats the file size to a readable format (Bytes, MB, GB) */
export const formatContentSize = (contentSize) =>{
    if (contentSize < 1024) {
        return `${contentSize} Bytes`;
    } else if (contentSize < 1024 * 1024) {
        return `${(Math.round(contentSize / 1024 * 100) / 100).toFixed(2)} KB`; // Rounded to 2 decimal places
    } else if (contentSize < 1024 * 1024 * 1024) {
        return `${(Math.round(contentSize / 1024 / 1024 * 100) / 100).toFixed(2)} MB`; // Rounded to 2 decimal places
    } else {
        return `${(Math.round(contentSize / 1024 / 1024 / 1024 * 100) / 100).toFixed(2)} GB`; // Rounded to 2 decimal places for larger files
    }
}

/** Formats the date into a readable format */
export const formatDate = (dateString) => {
    const date = new Date(dateString);

    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format, with 12 instead of 0

    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
}