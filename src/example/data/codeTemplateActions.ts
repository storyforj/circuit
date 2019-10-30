import { createCodeTemplate, createInputDefinition, InputValues, Types } from "../../CodeTemplate";
import { IAppState } from "./store";

export default () => ({
  addCodeTemplate: (state) => ({
    ...state,
    codeTemplates: state.codeTemplates.concat(
      createCodeTemplate(
        createInputDefinition({}),
        (properties: InputValues) : string => {
          return `hello world ${properties.test}`;
        },
        Types.string(),
      ),
    ),
  } as IAppState),
});
