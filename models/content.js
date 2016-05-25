module.exports=function (sequelize,DataTypes) {
  return sequelize.define('content',{
      content:{
      type:DataTypes.STRING,
      allowNull:false
    }
  });
};
