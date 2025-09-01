async function getReferredBy(req) {
  if (!req.session.referral) return null;
  const referrer = await User.findOne({ referralCode: req.session.referral });
  req.session.referral = null;
  return referrer ? referrer._id : null;
}
