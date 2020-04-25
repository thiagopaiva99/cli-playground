export const getValidations = (field: any) => {
    if (!field.validators) {
        return ''
    }

    return field.validators.join(', ')
}