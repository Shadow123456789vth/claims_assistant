import axios, { AxiosInstance } from 'axios'

class ServiceNowAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })
  }

  // Claims endpoints
  async getClaims() {
    const response = await this.client.get('/now/table/x_claims')
    return response.data
  }

  async getClaimById(claimId: string) {
    const response = await this.client.get(`/now/table/x_claims/${claimId}`)
    return response.data
  }

  async createClaim(claimData: any) {
    const response = await this.client.post('/now/table/x_claims', claimData)
    return response.data
  }

  async updateClaim(claimId: string, claimData: any) {
    const response = await this.client.put(`/now/table/x_claims/${claimId}`, claimData)
    return response.data
  }
}

export default new ServiceNowAPI()
