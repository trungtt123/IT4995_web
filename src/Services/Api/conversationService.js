import axios from "../../setups/custom_axios";

const getConversation = (conversationId) => {
  return axios.get(`/conversation/conversation?conversationId=${conversationId}`);
}
const conversationService = {
  getConversation
};


export default conversationService;
