import axios from "axios";

//google captcha verification 
export const googleCaptchaVerify = () => {
    return async (req, res) => {
        const { captchaToken } = req.body;
        if (!captchaToken) {
          return res.status(400).send({ message: "Captcha Token is Required" });
        }
        try {
          const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY_V2}&response=${captchaToken}`
          );
  
          if (response.data.success) {
            res.send(response.data);
          } else {
            res.status(400).send({ error: "Captcha Varification Failed!" });
          }
        } catch (err) {
          res.status(500).send({ error: "Captcha Varification Failed!" });
        }
      }
}