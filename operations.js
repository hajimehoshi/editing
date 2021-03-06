// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file./*

//////////////////////////////////////////////////////////////////////
//
// Operation
//
editing.Operation = (function() {
  /**
   * @constructor
   * @struct
   * @param {string} operationName
   */
  function Operation(operationName) {
    /** @private @type {string} */
    this.operationName_ = operationName;
  }

  /**
   * @this {!Operation}
   */
  function redo() {
    throw new Error('Abstract method Operation.prototype.redo called', this);
  }

  /**
   * @this {!Operation}
   */
  function undo() {
    throw new Error('Abstract method Operation.prototype.undo called');
  }

  Operation.prototype = /** @struct*/ {
    constructor: Operation,
    execute: function() { this.redo(); },
    get operationName() { return this.operationName_; },
    redo: redo,
    undo: undo
  };
  Object.freeze(Operation.prototype);

  return Operation;
})();

//////////////////////////////////////////////////////////////////////
//
// AppendChild
//
editing.AppendChild = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Node} parentNode
   * @param {!Node} newChild
   */
  function AppendChild(parentNode, newChild) {
    console.assert(!newChild.parentNode);
    editing.Operation.call(this, 'appendChild');
    /** @private @type {!Node} */
    this.parentNode_ = parentNode;
    /** @private @type {!Node} */
    this.newChild_ = newChild;
    Object.seal(this);
  }

  /**
   * @this {!AppendChild}
   */
  function redo() {
    this.parentNode_.appendChild(this.newChild_);
  }

  /**
   * @this {!AppendChild}
   */
  function undo() {
    this.parentNode_.removeChild(this.newChild_);
  }

  AppendChild.prototype = /** @type {!AppendChild} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: AppendChild},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(AppendChild.prototype);

  return AppendChild;
})();

//////////////////////////////////////////////////////////////////////
//
// InsertBefore
//
editing.InsertBefore = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Node} parentNode
   * @param {!Node} newChild
   * @param {Node} refChild
   */
  function InsertBefore(parentNode, newChild, refChild) {
    console.assert(!newChild.parentNode);
    console.assert(parentNode === refChild.parentNode);
    editing.Operation.call(this, 'insertBefore');
    /** @private @type {!Node} */
    this.parentNode_ = parentNode;
    /** @private @type {!Node} */
    this.newChild_ = newChild;
    /** @private @type {!Node} */
    this.refChild_ = refChild;
    Object.seal(this);
  }

  /**
   * @this {!InsertBefore}
   */
  function redo() {
    this.parentNode_.insertBefore(this.newChild_, this.refChild_);
  }

  /**
   * @this {!InsertBefore}
   */
  function undo() {
    this.parentNode_.removeChild(this.newChild_);
  }

  InsertBefore.prototype = /** @type {!InsertBefore} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: InsertBefore},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(InsertBefore.prototype);

  return InsertBefore;
})();

//////////////////////////////////////////////////////////////////////
//
// RemoveAttribute
//
editing.RemoveAttribute = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @param {!Element} element
   * @param {string} attrName
   */
  function RemoveAttribute(element, attrName) {
    editing.Operation.call(this, 'removeAttribute');
    /** @private @type {!Element} */
    this.element_ = element;
    /** @private @type {string} */
    this.attrName_ = attrName;
    /** @private @type {(string|null)} */
    var oldValue = element.getAttribute(attrName);
    if (oldValue === null)
      throw new Error('You can not remove non-existing attribute ' + attrName);
    /** @private @type {string} */
    this.oldValue_ = oldValue;
    Object.seal(this);
  }

  /**
   * @this {!RemoveAttribute}
   */
  function redo() {
    this.element_.removeAttribute(this.attrName_);
  }

  /**
   * @this {!RemoveAttribute}
   */
  function undo() {
    this.element_.setAttribute(this.attrName_, this.oldValue_);
  }

  RemoveAttribute.prototype = /** @type {!RemoveAttribute} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: RemoveAttribute},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(RemoveAttribute.prototype);

  return RemoveAttribute;
})();

//////////////////////////////////////////////////////////////////////
//
// RemoveChild
//
editing.RemoveChild = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Node} parentNode
   * @param {!Node} oldChild
   */
  function RemoveChild(parentNode, oldChild) {
    editing.Operation.call(this, 'removeChild');
    /** @private @type {!Node} */
    this.parentNode_ = parentNode;
    /** @private @type {!Node} */
    this.oldChild_ = oldChild;
    /** @private @type {Node} */
    this.refChild_ = oldChild.nextSibling;
    Object.seal(this);
  }

  /**
   * @this {!RemoveChild}
   */
  function redo() {
    this.parentNode_.removeChild(this.oldChild_);
  }

  /**
   * @this {!RemoveChild}
   */
  function undo() {
    this.parentNode_.insertBefore(this.oldChild_, this.refChild_);
  }

  RemoveChild.prototype = /** @type {!RemoveChild} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: RemoveChild},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(RemoveChild.prototype);

  return RemoveChild;
})();

//////////////////////////////////////////////////////////////////////
//
// ReplaceChild
//
editing.ReplaceChild = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Node} parentNode
   * @param {!Node} newChild
   * @param {Node} oldChild
   */
  function ReplaceChild(parentNode, newChild, oldChild) {
    console.assert(!newChild.parentNode);
    console.assert(parentNode === oldChild.parentNode);
    editing.Operation.call(this, 'replaceChild');
    /** @private @type {!Node} */
    this.parentNode_ = parentNode;
    /** @private @type {!Node} */
    this.newChild_ = newChild;
    /** @private @type {Node} */
    this.oldChild_ = oldChild;
    Object.seal(this);
  }

  /**
   * @this {!ReplaceChild}
   */
  function redo() {
    this.parentNode_.replaceChild(this.newChild_, this.oldChild_);
  }

  /**
   * @this {!ReplaceChild}
   */
  function undo() {
    this.parentNode_.replaceChild(this.oldChild_, this.newChild_);
  }

  ReplaceChild.prototype = /** @type {!ReplaceChild} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: ReplaceChild},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(ReplaceChild.prototype);

  return ReplaceChild;
})();

//////////////////////////////////////////////////////////////////////
//
// SetAttribute
//
editing.SetAttribute = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Element} element
   * @param {string} attrName
   * @param {string} newValue
   */
  function SetAttribute(element, attrName, newValue) {
    if (newValue === null)
      throw new Error('You can not use null for attribute ' + attrName);
    editing.Operation.call(this, 'setAttribute');
    /** @private @type {!Element} */
    this.element_ = element;
    /** @private @type {string} */
    this.attrName_ = attrName;
    /** @private @type {string} */
    this.newValue_ = newValue;
    /** @private @type {(string|null)} */
    this.oldValue_ = element.getAttribute(attrName);
    Object.seal(this);
  }

  /**
   * @this {!SetAttribute}
   */
  function redo() {
    this.element_.setAttribute(this.attrName_, this.newValue_);
  }

  /**
   * @this {!SetAttribute}
   */
  function undo() {
    if (this.oldValue_ === null)
      this.element_.removeAttribute(this.attrName_);
    else
      this.element_.setAttribute(this.attrName_, this.oldValue_);
  }

  SetAttribute.prototype = /** @type {!SetAttribute} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: SetAttribute},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(SetAttribute.prototype);

  return SetAttribute;
})();

//////////////////////////////////////////////////////////////////////
//
// SetStyle
// We consolidate inline style changes into one operation to keep ordering
// of STYLE attribute value.
//
editing.SetStyle = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Element} element
   */
  function SetStyle(element) {
    editing.Operation.call(this, 'setStyle');
    /** @private @type {!Array.<{name: string, value: string}>} */
    this.changes_ = [];
    /** @private @type {!Element} */
    this.element_ = element;
    this.oldStyleText_ = element.getAttribute('style');
    Object.seal(this);
  }

  /**
   * @this {!SetStyle}
   */
  function redo() {
    // Restore to initial state.
    this.undo();
    // Apply changes.
    var style = this.element_.style;
    for (var property of this.changes_)
      style[property.name] = property.value;
  }

  /**
   * @this {!SetStyle}
   * @param {string} propertyName
   * @param {string} propertyValue
   */
  function setProperty(propertyName, propertyValue) {
    console.assert(propertyName in this.element_.style,
                   'Unknown CSS property name', propertyName);
    this.changes_.push({name: propertyName, value: propertyValue});
  }

  /**
   * @this {!SetStyle}
   */
  function undo() {
    if (this.oldStyleText_ === null) {
      this.element_.removeAttribute('style');
      return;
    }
    this.element_.setAttribute('style', this.oldStyleText_);
  }

  SetStyle.prototype = /** @type {!SetStyle} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: SetStyle},
      redo: {value: redo},
      setProperty: {value: setProperty},
      undo: {value: undo}
    }));
  Object.freeze(SetStyle.prototype);

  return SetStyle;
})();

//////////////////////////////////////////////////////////////////////
//
// SplitText
//
editing.SplitText = (function() {
  /**
   * @constructor
   * @extends {editing.Operation}
   * @final
   * @struct
   * @param {!Text} textNode
   * @param {!Text} newNode
   */
  function SplitText(textNode, newNode) {
    editing.Operation.call(this, 'splitText');
    /** @private @type {!Text} */
    this.newNode_ = newNode;
    /** @private @type {!Text} */
    this.textNode_ = textNode;
    Object.seal(this);
  }

  /**
   * @this {!SplitText}
   */
  function redo() {
    var text = this.textNode_.nodeValue;
    this.textNode_.nodeValue = text.substr(
        0, text.length - this.newNode_.nodeValue.length);
    this.textNode_.parentNode.insertBefore(this.newNode_,
                                           this.textNode_.nextSibling);
  }

  /**
   * @this {!SplitText}
   */
  function undo() {
    this.textNode_.nodeValue += this.newNode_.nodeValue;
    this.newNode_.parentNode.removeChild(this.newNode_);
  }

  SplitText.prototype = /** @type {SplitText} */
    (Object.create(editing.Operation.prototype, {
      constructor: {value: SplitText},
      redo: {value: redo},
      undo: {value: undo}
    }));
  Object.freeze(SplitText.prototype);

  return SplitText;
})();
