import React, { useState } from 'react';
import { Report, EditorProps, Editor } from '../src/index';

const sampleReport: Report = {
  name: 'Report 1',
  target: 'pdf',
  children: [],
  transforms: [],
  properties: {},
  dataUrl: '',
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

const sampleData = new Employee('Alice', 30, 'Iceberg mover');

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
  const props2: EditorProps = {
    report: report,
    setReport: setReport2,
    sourceData: sampleData,
    api: {},
    hasUndoRedo: true,
    ...(undoNext > 1 ? { undo } : {}),
    ...(undoNext < undoStack.length ? { redo } : {}),
  };
  return <Editor {...props2} />;
}
