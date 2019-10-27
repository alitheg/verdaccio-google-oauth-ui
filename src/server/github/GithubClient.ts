import got, { GotJSONOptions } from "got"
import { merge } from "lodash"

import { GitHubOAuth } from "./OAuth"
import { GitHubOrganization } from "./Organization"
import { GitHubUser } from "./User"

export class GitHubClient {

  private readonly defaultOptions = {
    headers: {
      "User-Agent": this.userAgent,
    },
    json: true,
  }

  constructor(
    private readonly userAgent: string,
    private readonly enterpriseOrigin?: string,
  ) { }

  get webBaseUrl(): string {
    return this.enterpriseOrigin || "https://github.com"
  }

  get apiBaseUrl(): string {
    return this.enterpriseOrigin
      ? this.enterpriseOrigin.replace(/\/?$/, "") + "/api/v3"
      : "https://api.github.com"
  }

  /**a
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    const url = this.webBaseUrl + "/login/oauth/access_token"
    const options = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    }
    return this.request<GitHubOAuth>(url, options)
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string) => {
    const url = this.apiBaseUrl + "/user"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
    return this.request<GitHubUser>(url, options)
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (accessToken: string) => {
    const url = this.apiBaseUrl + "/user/orgs"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
    return this.request<GitHubOrganization[]>(url, options)
  }

  private async request<T>(url: string, additionalOptions: Partial<GotJSONOptions>): Promise<T> {
    const options = merge({}, this.defaultOptions, additionalOptions)
    const response = await got(url, options)
    return response.body
  }

}
