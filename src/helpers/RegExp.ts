export const URLRegexp = /^https?:\/\/[^\s$.?#].[^\s]*$/gm;
export const imageURLRegexp = /https?:\/\/.*\.(?:png|jpe?g|webp)/;
export const idRegexp = /^\d{17,19}$/;
export const idOrMentionRegexp = /^<@!?(\d{17,19})>$|^(\d{17,19})$/;
export const idOrMentionChannelRegexp = /^<#(\d{17,19})>$|^(\d{17,19})$/;