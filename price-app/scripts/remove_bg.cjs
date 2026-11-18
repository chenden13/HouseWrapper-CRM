const { AutoModel, AutoProcessor, RawImage } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  console.log('Loading RMBG-1.4 model...');
  const model_id = 'briaai/RMBG-1.4';
  const model = await AutoModel.from_pretrained(model_id);
  const processor = await AutoProcessor.from_pretrained(model_id);

  console.log('Loading car image...');
  const origPath = path.resolve(__dirname, '../public/car_front_diagram_orig.png');
  const imagePath = fs.existsSync(origPath) ? origPath : path.resolve(__dirname, '../public/car_front_diagram.png');
  const image = await RawImage.read(imagePath);

  console.log('Running background removal model...');
  const { pixel_values } = await processor(image);
  const { output } = await model({ input: pixel_values });

  console.log('Post-processing mask...');
  // output is tensor of shape [1, 1, H, W] with float values 0..1
  // Convert to uint8 mask
  const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);

  console.log('Mask dimensions:', mask.width, mask.height, 'data length:', mask.data.length);
  console.log('Image dimensions:', image.width, image.height, 'data length:', image.data.length);

  // Combine image RGB (3 channels) with mask (1 channel) into RGBA buffer
  const rgbaBuffer = Buffer.alloc(image.width * image.height * 4);
  const numPixels = image.width * image.height;

  for (let i = 0; i < numPixels; i++) {
    const srcRGB = i * image.channels;
    const dstRGBA = i * 4;

    rgbaBuffer[dstRGBA] = image.data[srcRGB];
    rgbaBuffer[dstRGBA + 1] = image.data[srcRGB + 1];
    rgbaBuffer[dstRGBA + 2] = image.data[srcRGB + 2];
    
    // Mask value (alpha channel)
    // If mask has 1 channel: mask.data[i]
    rgbaBuffer[dstRGBA + 3] = mask.data[i * mask.channels];
  }

  const outputPath = path.resolve(__dirname, '../public/car_front_diagram.png');
  await sharp(rgbaBuffer, {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4
    }
  }).png().toFile(outputPath);

  console.log('Transparent background car saved successfully to:', outputPath);
}

run().catch(err => {
  console.error('Error running RMBG:', err);
  process.exit(1);
});
