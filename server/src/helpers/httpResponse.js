export const ok = body => {
  return {
    success: true,
    statusCode: 200,
    body,
  }
}

export const notFound = body => {
  return {
    success: true,
    statusCode: 200,
    body,
  }
}

export const serverError = body => {}
