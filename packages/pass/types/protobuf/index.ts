/*
 * We use a slightly altered data model than what protobuf would produce
 * internally, because the generics and polymorphism are easier to work with
 * this way, or better said, protobuf doesn't produce very easy-to-consume
 * types.
 */
import type { ExtraField, PlatformSpecific } from './item-v1';
import {
    Content,
    Metadata,
    Item as ProtobufItem,
    ItemAlias as ProtobufItemAlias,
    ItemCreditCard as ProtobufItemCreditCard,
    ItemLogin as ProtobufItemLogin,
    ItemNote as ProtobufItemNote,
} from './item-v1';
import { Vault } from './vault-v1';

export {
    Content,
    ExtraField,
    Metadata,
    ProtobufItem,
    ProtobufItemAlias,
    ProtobufItemCreditCard,
    ProtobufItemLogin,
    ProtobufItemNote,
    Vault,
};

/**
 * Excludes the undefined oneofKind type generated by protoc-gen-ts
 * in ProtobufItem['content']
 */
type OneOfKindKeys<T extends { content: any }> = Extract<T['content'], { oneofKind: string }>;
type OneOfKindMap<U extends { oneofKind: string }> = {
    [T in U as T['oneofKind']]: Omit<T, 'oneofKind'> extends infer ContentType ? ContentType[keyof ContentType] : never;
};

/**
 * Intermediary utility type that will flatten the union type resulting
 * from SafeProtobufItemContent to a single mapped object type containing
 * all possible key/type pairs for the underlying content types
 */
type ItemContentUnion = OneOfKindKeys<Content>;
export type ItemContentMap = OneOfKindMap<ItemContentUnion>;
export type ItemType = keyof ItemContentMap;

type ExtraFieldContentUnion = OneOfKindKeys<ExtraField>;
export type ExtraFieldContentMap = OneOfKindMap<ExtraFieldContentUnion>;
export type ExtraFieldType = keyof ExtraFieldContentMap;

/**
 * Creates a generic "distributive object type" over all possible
 * oneofKind keys - When decoding protobuf items, this will allow us
 * to select the underlying content type by its oneofKind property
 * while maintaining strong type safety
 */
export type SafeProtobufItem<T extends ItemType = ItemType> = {
    content: {
        content: {
            [Key in T]: {
                oneofKind: Key;
            } & { [ItemKey in Key]: ItemContentMap[Key] };
        }[T];
    };
    metadata: Metadata;
    extraFields: SafeProtobufExtraField[];
    platformSpecific?: PlatformSpecific;
};

export type SafeProtobufExtraField<T extends ExtraFieldType = ExtraFieldType> = { fieldName: string } & {
    [Key in T]: {
        content: { oneofKind: Key } & {
            [ExtraFieldKey in Key]: ExtraFieldContentMap[Key];
        };
    };
}[T];
