import formidable from 'formidable';
import fs from 'fs';
import prisma from "../prisma_client";
import {NextApiRequest, NextApiResponse} from "next";

export const config = {
  api: {
    bodyParser: false
  }
};

// POST /api/students/import
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await post(req, res);
  } else {
    res.status(405).end();
  }
}

const post = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (files.file) {
      await saveFile(files.file);
      res.status(200).json({'message': 'File uploaded successfully'});
    } else {
      res.status(400).json({ message: 'No file was uploaded' });
    }
  });
};

const saveFile = async (file: any) => {
  if (file.originalFilename.split('.').pop() !== 'csv') {
    return;
  }
  const data = fs.readFileSync(file.filepath);
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  fs.writeFileSync(`./public/${timestamp}-${file.originalFilename}`, data);
  await fs.unlinkSync(file.filepath);
  await evaluateFile(`./public/${timestamp}-${file.originalFilename}`);
  return;
};

const evaluateFile = async (filepath: string) => {
  // Before evaluating the file, we need to make sure that the file is valid
  const data = fs.readFileSync(filepath);
  const lines = data.toString().split('\n');
  // const headers = lines[0].split(',');
  await prisma.student.deleteMany({});
  // Read the CSV and write every line as student to the database
  // This should be a bulk operation
  for (let i = 1; i < (lines.length - 1); i++) {
    const line = lines[i];
    const values = line.split(',');
    const student = {
      firstName: values[0],
      secondName: values[1],
      lastName: values[2],
      grade: values[3],
    };
    await prisma.student.create({
      data: student
    })
  }
  return;
}
