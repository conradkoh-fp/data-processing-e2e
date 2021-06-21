import { Mode } from "./Mode";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
export interface SetupConfig {
  mode: Mode;
  options: {
    runName: string;
  };
}

export async function setup(config: SetupConfig) {
  const { mode } = config;
  let runName = config.options?.runName;
  switch (mode) {
    case Mode.Archive: {
      //In archive mode, we move folders first and update the name before processing
      const oldname = runName;
      const newname = new Date().getTime() + "_" + runName;
      const makeRelPath = (...rel: string[]) => {
        return path.join(__dirname, ...rel);
      };
      if (!fs.existsSync(makeRelPath("../data", oldname))) {
        throw new Error("Archive mode must specify a valid source file path");
      }
      await new Promise<void>((resolve, reject) => {
        fs.rename(
          makeRelPath("../data", oldname),
          makeRelPath("../data", newname),
          (err) => {
            err ? reject(err) : resolve();
          }
        );
      });
      runName = newname;
      break;
    }
    case Mode.Reprocess: {
      if (!config.options?.runName) {
        throw new Error("Run name must be specified in reprocess mode.");
      }
      runName = config.options?.runName;
      break;
    }
    case Mode.Current: {
      break;
    }
    default: {
      throw new Error("Unsupported mode: " + mode);
    }
  }

  //Prepare any necessary folders
  const outFolder = path.join(__dirname, "../out");
  const sourceFolder = path.join(__dirname, "../data", runName);
  await Promise.all([mkdirp(outFolder), mkdirp(sourceFolder)]);
  const outFileName = runName + ".txt";
  const outFile = path.join(outFolder, outFileName);
  return { sourceFolder, outFile };
}
