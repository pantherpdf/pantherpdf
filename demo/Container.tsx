import React, { useState } from 'react';
import { Report, Editor, SourceData, ApiEndpoints } from '../src/index';
import Typography from '@mui/material/Typography';
import { FontStyle } from '../src/widgets/PropertyFont';

const sampleReport: Report = {
  widgets: [],
  transforms: [],
  properties: {},
  variables: [],
};

class Person {
  public name: string;
  public age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  generateImage(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABlBMVEUAAAA2OUodDAXZAAAAAXRSTlMAQObYZgAAAMVJREFUeNrd19EKg0AQQ9G5///TfRJx2zETAko3b9tmjlDFobV3OONPrrHnI+NH2TKa4pxoW0PhrjQS7ivkACbgC6qQA7ogKCWAatrAOgX4ANeD/xsAED1rDkCJPHobiICCI3Ngqc8A2cd55egXD8jvUBfROKfhzaM2wfm5xjnSbK0e0FuyIUDvyrslYa/xb6AigBwoG2A5+cL18AZABtT/A+RAbQbwMlA+QA7UdgApYBJAt0CmgFhCyT+bHjKuoFLTiLk0Hyk1Ai3Jfv5DAAAAAElFTkSuQmCC';
  }

  get canVote() {
    return this.age >= 18;
  }
}

class Employee extends Person {
  public job: string;

  constructor(name: string, age: number, job: string) {
    super(name, age);
    this.job = job;
  }

  getJob(): string {
    return this.job.toUpperCase();
  }
}

const sampleDataWrapper: SourceData = {
  type: 'callback',
  callback: () => new Employee('Alice', 30, 'Iceberg mover'),
  description: 'Employee Alice',
};

const systemFonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman'];
const googleFonts = ['Roboto', 'Lato', 'Open Sans', 'Roboto Mono'];

const api: ApiEndpoints = {
  fonts: {
    list: [...systemFonts, '', ...googleFonts],
    getCssUrls: arr =>
      arr
        .filter(obj => googleFonts.indexOf(obj.name) !== -1)
        .map(googleFontCssUrl),
  },
};

export default function Container() {
  const [report, setReport] = useState<Report>(sampleReport);

  const [undoStack, setUndoStack] = useState<Report[]>([sampleReport]);
  const [undoNext, setUndoNext] = useState<number>(1);

  function setReport2(val: Report) {
    setReport(val);
    const newUndoStack = [...undoStack];
    newUndoStack.splice(undoNext);
    newUndoStack.push(val);
    setUndoStack(newUndoStack);
    setUndoNext(undoNext + 1);
  }

  function undo() {
    setReport(undoStack[undoNext - 2]);
    setUndoNext(undoNext - 1);
  }

  function redo() {
    setReport(undoStack[undoNext]);
    setUndoNext(undoNext + 1);
  }

  // show editor
  return (
    <Editor
      layout="fullscreen"
      report={report}
      setReport={setReport2}
      sourceData={sampleDataWrapper}
      api={api}
      navbar={{
        hasUndoRedo: true,
        undo: undoNext > 1 ? undo : undefined,
        redo: undoNext < undoStack.length ? redo : undefined,
        left: <Brand />,
      }}
    />
  );
}

function Brand() {
  return (
    <Typography sx={{ marginLeft: 1 }} fontWeight="bold">
      PantherPDF
    </Typography>
  );
}

function googleFontCssUrl(f: FontStyle) {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.name)}:ital,wght@${f.italic ? 1 : 0},${encodeURIComponent(f.weight)}&display=swap`;
}
