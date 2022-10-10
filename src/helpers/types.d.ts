import { ApplicationCommandOptionsStringWithoutAutocomplete, Role, User, InteractionDataOptionWithValue } from "eris";

export interface ApplicationCommandOptionsStringWithoutAutocompleteWithMaxLength extends ApplicationCommandOptionsStringWithoutAutocomplete {
    max_length?: number;
}

export type InteractionDataOptionsAttachment = InteractionDataOptionWithValue<11, string>;