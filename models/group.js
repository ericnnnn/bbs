module.exports=function (sequelize,DataTypes) {
  return sequelize.define('group',{
    title:{
      type:DataTypes.STRING,
      allowNull:false
    }
  });
};
