document.getElementById('upload').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const quality = parseFloat(document.getElementById('quality').value);
    const maxDimension = parseInt(document.getElementById('max-dimension').value);
    const files = event.target.files;
    const status = document.getElementById('status');

    if (files.length > 0) {
        status.innerText = 'Processing images...';
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                console.error('Unsupported file format:', file.type);
                status.innerText = 'Error: Unsupported file format. Please upload an image file.';
                return;
            }

            const reader = new FileReader();
            reader.onerror = function () {
                console.error('FileReader error:', reader.error);
                status.innerText = 'Error: Failed to read file.';
            };
            reader.onload = function (e) {
                const img = new Image();
                img.onerror = function () {
                    console.error('Image loading error.');
                    status.innerText = 'Error: Failed to load image.';
                };
                img.onload = function () {
                    try {
                        compressImage(img, quality, maxDimension, file.type, file.name, (compressedBlob) => {
                            if (compressedBlob) {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(compressedBlob);
                                link.download = `compressed_${file.name}`;
                                link.click();
                                status.innerText = 'Image compressed and downloaded successfully.';
                                console.log('Compression and download successful.');
                            } else {
                                console.error('Compression failed.');
                                status.innerText = 'Error: Failed to compress image.';
                            }
                        });
                    } catch (error) {
                        console.error('Compression error:', error);
                        status.innerText = 'Error: Compression process failed.';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

function compressImage(image, quality, maxDimension, fileType, fileName, callback) {
    try {
        let width = image.width;
        let height = image.height;

        // Scale down large images
        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height *= maxDimension / width;
                width = maxDimension;
            } else {
                width *= maxDimension / height;
                height = maxDimension;
            }
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        let outputFormat = 'image/jpeg';
        if (fileType === 'image/png') {
            outputFormat = 'image/png';
        } else if (fileType === 'image/webp') {
            outputFormat = 'image/webp';
        } else if (fileType === 'image/bmp') {
            outputFormat = 'image/bmp';
        }

        canvas.toBlob((blob) => {
            callback(blob);
        }, outputFormat, quality);
    } catch (error) {
        console.error('Compress image error:', error);
        callback(null);
    }
}
