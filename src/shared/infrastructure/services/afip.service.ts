import EnvVar from '../../config/env-var.config'

const AFIP_AUTH_URL = 'https://app.afipsdk.com/api/v1/afip/auth'
const AFIP_REQUESTS_URL = 'https://app.afipsdk.com/api/v1/afip/requests'
const WSID = 'ws_sr_constancia_inscripcion'
// Nombre real del método SOAP de ws_sr_constancia_inscripcion (no "getTaxpayerDetails",
// ese es solo el nombre que usan los SDKs de cada lenguaje; la API REST cruda espera
// el nombre del método tal cual está en el WSDL de AFIP).
const METHOD = 'getPersona_v2'

interface AfipAuth {
  token: string
  sign: string
}

class AfipService {
  private readonly accessToken = EnvVar.afip.accessToken
  private readonly cuitRepresentada = EnvVar.afip.cuitRepresentada
  private readonly environment = EnvVar.afip.environment

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`
    }
  }

  private async authenticate(): Promise<AfipAuth> {
    const response = await fetch(AFIP_AUTH_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        environment: this.environment,
        tax_id: this.cuitRepresentada,
        wsid: WSID
      })
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`AFIP auth failed with status ${response.status}: ${body}`)
    }

    return (await response.json()) as AfipAuth
  }

  /** true si el CUIT existe en el padrón de ARCA (ws_sr_constancia_inscripcion), false si no. */
  async cuitExists(cuit: string): Promise<boolean> {
    const { token, sign } = await this.authenticate()

    const response = await fetch(AFIP_REQUESTS_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        environment: this.environment,
        method: METHOD,
        wsid: WSID,
        params: {
          token,
          sign,
          cuitRepresentada: this.cuitRepresentada,
          idPersona: cuit
        }
      })
    })

    if (!response.ok) {
      // El body solo se puede leer una vez -- lo leemos como texto primero y
      // recién después intentamos parsearlo, para no pisarnos el stream entre
      // el chequeo del 422 y el throw genérico de abajo.
      const rawBody = await response.text().catch(() => '')

      // ARCA responde 422 + "No existe persona con ese Id" como fault SOAP cuando el CUIT
      // no está en el padrón — es un resultado válido (no existe), no una falla del servicio.
      if (response.status === 422) {
        const body = (() => {
          try {
            return JSON.parse(rawBody)
          } catch {
            return null
          }
        })()

        if (typeof body?.message === 'string' && body.message.includes('No existe persona')) {
          return false
        }
      }

      throw new Error(`AFIP taxpayer lookup failed with status ${response.status}: ${rawBody}`)
    }

    const data = await response.json()
    return data !== null
  }
}

export default AfipService
