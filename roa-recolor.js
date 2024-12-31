function hex2rgb(hex) {
    const rgb = [];
    const bigint = parseInt(hex, 16);
    rgb[0] = (bigint >> 16) & 255;
    rgb[1] = (bigint >> 8) & 255;
    rgb[2] = bigint & 255;
    return rgb;
}

function hexDecode(hex) {
    // delete those "-" from the code
    let newHex = hex.replace(/-/g, "");

    // split each color for every 6 characters
    const charHex = newHex.match(/.{1,6}/g);

    // create an array for the shader with rgba values
    const charRGB = [];
    for (let i = 0; i < charHex.length; i++) {
        const newArr = hex2rgb(charHex[i]);
        charRGB.push(newArr[0], newArr[1], newArr[2], 1); //r, g, b, a
    }
    return charRGB;
}

async function recolorImage(pngInput, charName, skinCode) {
    // Load character data
    const charData = await (await fetch(`lib/RoA-Skin-Recolorer/Characters/${charName}.json`)).json();

    // Create and append the canvas element
    const canvas = document.createElement('canvas');

    // Ensure the canvas has a context
    const context = canvas.getContext('webgl2');
    if (!context) {
        throw new Error('WebGL2 not supported');
    }

    // Initialize the RoaRecolor class
    const recolor = new RoaRecolor(canvas);

    // Update shader data
    const colIn = charData.colorData.Default.ogColor;
    const colRan = charData.colorData.Default.colorRange;
    const blend = false; // Set blend value as needed
    const special = 0; // Default special value

    const goldBorders = false
    recolor.updateData(charName, colIn, colRan, blend, special);

    // Add the image
    await recolor.addImage(pngInput);

    let rgb = hexDecode(skinCode); // translate the color code
    if (rgb != charData.skinList.Default) { // if the code is not the default one
        rgb.splice(rgb.length - 4); //remove the checksum at the end of the code
    } else { // if default code, we'll modify it later
        rgb = null;
    }

    if (charName == "Orcane") { // orcane has green and yellow hidden parts
        // copy either given array or og colors
        rgb = rgb ? [...rgb] : [...charData.colorData.Default.ogColor];
        for (let i = 0; i < 8; i++) {
            // orcane is a very special boi
            if (goldBorders) {
                rgb[i+8] = 255;
            } else {
                // add the 1st colors as the 3rd colors, 2nd to 4th
                rgb[i+8] = rgb[i];
            }
        }
    }

    if (!rgb) {
        rgb = charData.colorData.Default.ogColor;
    }

    // add in custom transparency in case the user modified it
    for (let i = 0; i < rgb.length; i++) {
        if ((i+1)%4 == 0) {
            rgb[i] = 1;
        }
    }

    // golden skins have a predefined color for black pixels
    if (goldBorders) {
        rgb = [...rgb, 76, 53, 0, 1]
    }

    recolor.render(rgb);

    // Return the recolored image as a data URL
    return canvas.toDataURL('image/png');
}

// Attach recolorImage to the window object to make it globally accessible
window.recolorImage = recolorImage;