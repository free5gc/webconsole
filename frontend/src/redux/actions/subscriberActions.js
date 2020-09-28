
export default class subscriberActions {
  static SET_SUBSCRIBERS = 'SUBSCRIBER/SET_SUBSCRIBERS';

  /**
   * @param subscribers  {Subscriber}
   * //Bajo 20200710
   * @param subscribers  {subscriberData}
   */
  static setSubscribers(subscribers) {
    return {
      type: this.SET_SUBSCRIBERS,
      subscribers: subscribers,
    };
  }
}
