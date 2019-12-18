
module.exports = ( { qname, operation, time, limit } = {} ) => ( {
    qname: qname || 'action_comment',
    operation: operation || 'proxy-comment',
    rechargeTime: time || 0.05,
    limit: limit || 10
} );
