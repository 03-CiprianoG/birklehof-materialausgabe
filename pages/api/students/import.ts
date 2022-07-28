import formidable from 'formidable';
import fs from 'fs';
import prisma from "../../../prismaClient";
import {NextApiRequest, NextApiResponse} from "next";
import middleware from "../middleware";
import {getToken} from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET

export const config = {
  api: {
    bodyParser: false
  }
};

// POST /api/students/import
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!await middleware(await getToken({ req, secret }), ['admin', 'superadmin'])) {
    res.status(403).end();
  }

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
      const valid = await validateFile(files.file);
      
      if (!valid) {
        res.status(400).json({ message: 'Datei ungültig' });
        return;
      }

      const success = await evaluateFile(files.file);

      if (success) {
        res.status(200).end();
      } else {
        res.status(500).end();
      }
    } else {
      res.status(400).json({ message: 'Fehler bei der Übertragung' });
    }
  });
};

const validateFile: (file: any) => Promise<boolean> = async (file: any) => {
  // Before evaluating the file, we need to make sure that the file is valid
  const data = fs.readFileSync(file.filepath);
  const lines = data.toString().split('\n');
  const headers = lines[0].split(',');
  // Check if the headers are correct
  return !(headers[0] !== 'Schülernummer' || headers[1] !== 'Nachname' || headers[2] !== 'Vorname' || headers[3] !== 'Vorname 2' || headers[4] !== 'Namenszusatz' || headers[5] !== 'Klasse');
}

const evaluateFile: (file: any) => Promise<boolean> = async (file: any) => {
  try {
    const data = fs.readFileSync(file.filepath);
    const lines = data.toString().split('\n');
    // const headers = lines[0].split(',');
    await prisma.student.deleteMany({});
    // Read the CSV and write every line as student to the database
    // This should be a bulk operation
    let batchQuery = {
      data: [],
      skipDuplicates: true,
    };
    for (let i = 1; i < (lines.length - 1); i++) {
      const line = lines[i];
      const values = line.split(',');
      const student = {
        number : parseInt(values[0]),
        lastName : values[1],
        firstName : values[2],
        secondName : values[3],
        nameAlias : values[4],
        grade : values[5]
      };
      batchQuery.data.push(student);
    }
    await prisma.student.createMany(batchQuery);
    return true;
  } catch (e) {
    return false;
  }
}
