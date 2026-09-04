/** Fabrique isolée de `useMinutiaPairs` : `useLayers` l'invalide aussi, et un import croisé
 *  entre les deux fichiers de hooks formerait un cycle de modules. */
export const minutiaPairKeys = {
  all: ['minutia-pairs'] as const,
  list: (traceId: string, referencePrintId: string) =>
    [...minutiaPairKeys.all, traceId, referencePrintId] as const,
}
