const fs = require('fs');
const path = require('path');

const imageController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

imageController.uploadImage = async (req, res) => {
  try {
    const image = req.files.fileToUpload;

    // create images folder if not exists
    const dir = path.resolve(`src/public/images`);
    if (!fs.existsSync(dir)) {
      console.log('Creating Route for Images', dir);
      fs.mkdirSync(dir, { recursive: true });
    }

    const name = `${`${Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 20)}.${image.name}`}`;
    image.mv(`${dir}/${name}`);
    console.log('Image uploaded');

    return await res.status(200).json({
      success: true,
      file: `http://localhost:3000/images/${name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

imageController.uploadFile = async (req, res) => {
  try {
    const image = req.files.fileToUpload;

    // create images folder if not exists
    const dir = path.resolve(`src/public/files`);
    if (!fs.existsSync(dir)) {
      console.log('Creating Routes for Archives', dir);
      fs.mkdirSync(dir, { recursive: true });
    }

    const name = `${`${Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 20)}.${image.name}`}`;
    image.mv(`${dir}/${name}`);
    console.log('File uploaded');

    return await res.status(200).json({
      success: true,
      file: `http://localhost:3000/files/${name}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = imageController;
